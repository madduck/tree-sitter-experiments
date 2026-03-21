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
      $.whitespace,
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
              $.whitespace,
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

    name: $ => prec.right(
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
       * Where is this conflict, and why is there no complaint about
       * the `quoted_name` further down?
       *
       * And what do we use? prec.right and prec.left both give different
       * errors in the test output.
       */
      seq(
        $.alnum_word,
        repeat(seq($.whitespace, $.alnum_word))
      )
    ),
    quoted_name: $ => seq(
      '"',
      $.word,
      repeat(seq($.whitespace, $.word)),
      '"'
    ),

    email: _$ => /\w+@example\.org/,
    bracketed_email: $ => seq("<", $.email, ">"),

    whitespace: _$ => /[ \t]+/,
    word: _$ => /\S+/,
    alnum_word: _$ => /\w+/,
  }
});
