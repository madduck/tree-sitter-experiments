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
  externals: $ => [
    $.newline,
    $.whitespace,
    $.logical_linebreak,
    $.double_newline
  ],

  rules: {
    // Any number of logical lines
    source: $ => seq(
      $.marker,
      choice(
        $.newline,
        $.whitespace,
        $.logical_linebreak,
        $.double_newline
      ),
      optional($.newline),
      $.marker,
      optional(/\r?\n/),
    ),

    marker: _$ => "x",
  }
});
