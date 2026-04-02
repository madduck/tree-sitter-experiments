/**
 * @file Test grammar for tree-sitter
 * @author m
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// This grammar exists to expose what I think are probably shortcomings
// in my understanding of how tree-sitter works. I am hoping that writing
// this will help me cut through this.
//
// The grammar is simple and can be described as rows of colon-separated
// key-value pairs. Read on, comments inline…

module.exports = grammar({
  name: "test",

  rules: {
    // "pairs in rows" are newline-separated pairs:
    source_file: $ => repeat(seq($.pair, $.newline)),
    newline: _$ => /\n/,
    hspace: _$ => /[ \t]+/,
    colon: _$ => ":",

    // and "colon-separated key-value pairs" are:
    pair: $ => seq($.key, $.colon, $.hspace, $.value),
    key: _$ => /[-\w]+/,
    // Keys may contain hyphens.

    // Now, let's define $.value to be a series of space-separated words, and
    // a word can include a hyphen so it's actually identical to key.
    //
    // Important about the spaces between words: those could wrap lines if the
    // next line starts itself with whitespace, i.e. "foo\n bar" would be
    // equivalent to "foo bar". This is not implemented, but it's relevant to
    // explain why $.value isn't just a regexp. Bear with me…

    word: _$ => /[-\w]+/,
    value: $ => seq($.word, repeat(seq($.hspace, $.word))),

    // Test "Five" fails, because the value contains a hypenated word, and that
    // confuses tree-sitter: it wants to apply $.key instead of $.word (because
    // the former is of higher lexical precedence, because it's defined
    // earlier (according to the lowest order conflict resolution rule (see
    // below)).
    //
    // At least I think that is why it considers $.key, but maybe I am wrong?
    // However, I think that another conflict resolution rule should actually
    // be applied, and I cannot figure out why it isn't.
    //
    // Let me explain:
    //
    // Within $.pair, once we passed $.key and the colon delimiter, we get into
    // $.value context, and $.key is not expected. The reason tree-sitter wants
    // to use it is due to the difference of lexical and parse precedence.
    //
    // However, what is confusing is that tree-sitter lexical conflict
    // resolution is described by a set of [five
    // rules](https://tree-sitter.github.io/tree-sitter/creating-parsers/3-writing-the-grammar.html?highlight=glr#conflicting-tokens),
    // and the first states:
    //
    // > Context-aware Lexing — Tree-sitter performs lexing on-demand, during
    // > the parsing process. At any given position in a source document, the
    // > lexer only tries to recognize tokens that are valid at that position
    // > in the document.
    //
    // So why does tree-sitter even consider $.key when according to the grammar,
    // it could not appear in this context?

  },
  // And for an encore: tree-sitter is a GLR-parser, which I understand to mean
  // that it is capable of branching at any point, consider multiple possible
  // rules "in parallel", and discard those branches that result in errors. For
  // it to do this, one declares explicit conflicts, …

  conflicts: $ => [

    // such as between $.word and $.key:
    [$.word, $.key],
    // but this will cause t-s generate to warn about an "unnecessary conflict".

    // Ok, so we go one level higher and define a conflict on ("within"?)
    // $.value. It feels weird because a conflict should involve 2+ elements,
    // but:
    [$.value]
    // and this actually fixes Test Five, but why?
  ],
});
