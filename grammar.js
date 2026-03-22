/**
 * @file Test grammar for tree-sitter
 * @author m
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "test",

  extras: _$ => [],

  rules: {
    source: $ => seq(
      alias("From:", $.label),
      alias($.whitespace, $.ws_after_label),
      choice(
        // what follows now is either a simple email address
        // From: foo@example.org
        $.email,
        // or one of these formats:
        // From: <foo@example.org>
        // From: Foo Bar <foo@example.org>
        // From: "Foo X. Bar" <foo@example.org>
        seq(
          // This is implemented by making the name part optional:
          optional(
            seq(
              choice(
                // a name (whitespace-separated words),
                $.name,
                // or a quoted name (whitespace-separated words within "")
                $.quoted_name
              ),
              // and some whitespace …
              alias($.whitespace, $.ws_after_name_before_email),
            )
            // note about whitespace: I need this as a token
            // because of logical line continuations, so please don't
            // suggest that I just match the entirety of the name with
            // a single regex.
          ),
          // … before the email address in angle brackets:
          $.bracketed_email
        )
      ),
      optional(/\r?\n/),
    ),

    name: $ =>
      /* Without prec.right or prec.left, there's an unresolved conflict:
       *
       * Unresolved conflict for symbol sequence:
       *
       *   'From: '  '_alnum_word'  •  '_whitespace'  …
       * 
       * Possible interpretations:
       *
       *   1:  'From: '  (name  '_alnum_word'  •  name_repeat1)
       *   2:  'From: '  (name  '_alnum_word')  •  '_whitespace'  …
       *
       * Possible resolutions:
       *
       *   1:  Specify a left or right associativity in `name`
       *   2:  Add a conflict for these rules: `name`
       *
       * prec.right in this context makes sense, as the lexer should consume
       * as many whitespace-delimited words as it can.
       */
      prec.right(
        seq(
          $.alnum_word,
          repeat(seq(
            alias($.whitespace, $.ws_between_name_words),
            $.alnum_word))
        )
      ),
    quoted_name: $ =>
      // prec.right not needed here due to the final quote
      seq(
        '"',
        $.word,
        repeat(seq(
          alias($.whitespace, $.ws_between_qname_words),
          $.word)),
        '"'
      ),

    email: _$ => /\w+@example\.org/,
    bracketed_email: $ => seq("<", $.email, ">"),

    whitespace: _$ => /[ \t]+/,
    word: _$ => /\S+/,
    alnum_word: _$ => /\w+/,
  }
});
