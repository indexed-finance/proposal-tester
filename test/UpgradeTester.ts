import { Contract } from "@ethersproject/contracts";
import { expect } from "chai";
import { impersonate, stopImpersonating } from "./utils";

export type TestData<C extends Contract, F extends keyof C['functions'] = any> = ({
  type: 'same_result';
  fn: F;
  args: Parameters<C['functions'][F]>;
} | {
  type: 'different_result'
  fn: F;
  args: Parameters<C['functions'][F]>;
  resultBefore?: ReturnType<C['functions'][F]>;
  resultAfter?: ReturnType<C['functions'][F]>;
} | {
  type: 'fix_revert';
  fn: F;
  args: Parameters<C['functions'][F]>;
  resultAfter?: ReturnType<C['functions'][F]>;
}) & {
  caller?: string;
  before?: () => Promise<void>;
  after?: () => Promise<void>;
}

export default class UpgradeTester<C extends Contract> {
  results = [];
  constructor(
    public contract: C,
    public tests: TestData<C>[]
  ) {}

  private async _testBefore(test: TestData<C>) {
    const call = ((
      test.caller ? this.contract.connect(await impersonate(test.caller)) : this.contract
    )[test.fn] as any)(...test.args);
    try {
      if (test.type === 'fix_revert') {
        await expect(call).to.be.reverted;
        this.results.push(undefined);
      } else if (test.type === 'same_result') {
        this.results.push(await call);
      } else if (test.type === 'different_result') {
        const result = await call;
        this.results.push(result);
        if (test.resultBefore) expect(result).to.deep.eq(test.resultBefore);
      }
      if (test.before) await test.before();
      if (test.caller) await stopImpersonating(test.caller);
    } catch (err) {
      if (test.caller) await stopImpersonating(test.caller);
      console.log(`Got Error Executing ${test.fn} with args ${test.args}`);
      throw Error(`Error Executing ${test.fn} with args ${test.args} --- ${err.message}`);
    }
  }

  private async _testAfter(test: TestData<C>, testIndex: number) {
    try {
      const call = ((
        test.caller ? this.contract.connect(await impersonate(test.caller)) : this.contract
      )[test.fn] as any)(...test.args);
      if (test.type === 'fix_revert') {
        if (test.resultAfter) {
          expect(await call).to.deep.eq(test.resultAfter);
        } else {
          await expect(call).to.not.be.reverted;
        }
      } else if (test.type === 'same_result') {
        const oldResult = this.results[testIndex];
        expect(await call).to.deep.eq(oldResult);
      } else if (test.type === 'different_result') {
        const result = await call;
        const oldResult = this.results[testIndex];
        expect(result).to.not.deep.eq(oldResult);
        if (test.resultAfter) expect(result).to.deep.eq(test.resultAfter);
      }
      if (test.after) await test.after();
      if (test.caller) await stopImpersonating(test.caller);
    } catch (err) {
      if (test.caller) await stopImpersonating(test.caller);
      console.log(`Got Error Executing ${test.fn} with args ${test.args}`);
      // console.log()
      throw Error(`Error Executing ${test.fn} with args ${test.args} --- ${err.message}`);
    }
  }

  async runAgainstCurrent() {
    for (let test of this.tests) await this._testBefore(test);
  }

  async runAgainstUpgrade() {
    for (let i = 0; i < this.tests.length; i++) await this._testAfter(this.tests[i], i);
  }
}