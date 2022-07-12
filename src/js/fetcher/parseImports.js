/*
 *
 *    Copyright 2022 flightpkg Contributors
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
 
const ts = require('typescript');

module.exports = function parseImports(contents) {
  const paths = [];

  function findChildImports(node) {
    if (
      node.kind === ts.SyntaxKind.ImportDeclaration ||
      (node.kind === ts.SyntaxKind.ExportDeclaration && node.moduleSpecifier)
    ) {
      paths.push(node.moduleSpecifier.text);
    } else if (
      node.kind === ts.SyntaxKind.CallExpression &&
      node.arguments &&
      node.arguments.length
    ) {
      if (
        node.expression.text === 'require' &&
        node.arguments[0].kind === ts.SyntaxKind.StringLiteral
      ) {
        paths.push(node.arguments[0].text);
      }

      if (
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments[0].text
      ) {
        paths.push(node.arguments[0].text);
      }

      if (
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          node.expression.text === 'require') &&
        node.arguments[0].kind === ts.SyntaxKind.TemplateExpression &&
        node.arguments[0].head.kind === ts.SyntaxKind.TemplateHead
      ) {
        paths.push(node.arguments[0].head.text);
      }

      if (
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          node.expression.text === 'require') &&
        node.arguments[0].kind === ts.SyntaxKind.BinaryExpression &&
        node.arguments[0].left.kind === ts.SyntaxKind.StringLiteral
      ) {
        paths.push(node.arguments[0].left.text);
      }
    }
    ts.forEachChild(node, findChildImports);
  }

  ts.forEachChild(
    ts.createSourceFile(
      'any',
      contents,
      ts.ScriptTarget.ES2015,
      true,
      ts.ScriptKind.JSX
    ),
    findChildImports
  );

  return paths;
};
