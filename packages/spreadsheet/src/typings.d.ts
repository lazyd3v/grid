declare module "fast-formula-parser/formulas/error" {
  class FormulaError {
    constructor(readonly error: string, readonly message?: string) {}
  }
  export default FormulaError;
}

declare module "fast-formula-parser/grammar/lexing" {
  function lex(text: string): LexResult;
  const tokenVocabulary: Record<string, any> = {};
  export interface LexResult {
    tokens: Token[];
  }
  export interface Token {
    image: string;
    tokenType: {
      name: string;
    };
  }
  export { lex, tokenVocabulary };
}
