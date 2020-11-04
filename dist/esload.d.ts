import type { Plugin } from 'esbuild';
import type { RuleSetLoader } from 'webpack';
declare type Rule = {
    test: RegExp;
    use: Array<string | RuleSetLoader>;
};
export declare const esload: (options: {
    name: string;
    outdir: string;
    rules: Array<Rule>;
}) => Plugin;
export {};
//# sourceMappingURL=esload.d.ts.map