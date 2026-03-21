/**
 * @file Test grammar for tree-sitter
 * @author m
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "test",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
