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
  conflicts: $ => [[$.name]],

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
      // $.name is included in conflicts above such that TS can resolve the
      // ambiguity that arises when $.name is followed by $.whitespace.
      seq(
        $.alnum_word,
        repeat(
          seq(
            alias($.whitespace, $.ws_between_name_words),
            $.alnum_word
          )
        )
      ),
    quoted_name: $ =>
      // prec.right not needed here due to the final quote
      seq(
        '"',
        $.word,
        repeat(
          seq(
            alias($.whitespace, $.ws_between_qname_words),
            $.word
          )
        ),
        '"'
      ),

    email: _$ => /\w+@example\.org/,
    bracketed_email: $ => seq("<", $.email, ">"),

    whitespace: _$ => /[ \t]+/,
    word: _$ => /[^"\s]+/,
    alnum_word: _$ => /\w+/,
  }
});
