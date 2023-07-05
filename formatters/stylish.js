import _ from 'lodash';

const [plus, minus, space, indentSymbol, spaceCount] = ['+ ', '- ', '  ', ' ', 4];

const stringifyObject = (object, depth) => {
  const indentSize = depth * spaceCount;
  const bracketIndent = indentSymbol.repeat(indentSize - spaceCount);
  const keys = Object.keys(object);
  const lines = keys.map((key) => {
    if (_.isObject(object[key])) {
      return `${indentSymbol.repeat(indentSize)}${key}: ${stringifyObject(object[key], depth + 1)}`;
    }
    return `${indentSymbol.repeat(indentSize)}${key}: ${object[key]}`;
  });

  return [
    '{',
    ...lines,
    `${bracketIndent}}`,
  ].join('\n');
};

const getSpecialSymbol = (node) => {
  const { status } = node;
  switch (status) {
    case 'added':
      return '+ ';
    case 'deleted':
      return '- ';
    case 'unchanged':
      return '  ';
    default:
      throw new Error(`Uncorrect status: '${status}'!`);
  }
};

const stringify = (node, depth) => {
  const { status } = node;
  const indentSize = depth * spaceCount;

  if (status === 'added' || status === 'deleted' || status === 'unchanged') {
    const specialSymbol = getSpecialSymbol(node);
    if (_.isObject(node.value)) {
      return `${indentSymbol.repeat(depth * spaceCount - 2)}${specialSymbol}${node.key}: ${stringifyObject(node.value, depth + 1)}`;
    }
    return `${indentSymbol.repeat(indentSize - 2)}${specialSymbol}${node.key}: ${node.value}`;
  }

  if (node.status === 'changed') {
    let oldValue;
    let newValue;
    if (_.isObject(node.oldValue)) {
      oldValue = `${indentSymbol.repeat(indentSize - 2)}${minus}${node.key}: ${stringifyObject(node.oldValue, depth + 1)}`;
      newValue = `${indentSymbol.repeat(indentSize - 2)}${plus}${node.key}: ${node.newValue}`;
    }

    if (_.isObject(node.newValue)) {
      oldValue = `${indentSymbol.repeat(indentSize - 2)}${minus}${node.key}: ${node.oldValue}`;
      newValue = `${indentSymbol.repeat(indentSize - 2)}${plus}${node.key}: ${stringifyObject(node.newValue, depth + 1)}`;
    }

    if (!_.isObject(node.oldValue) && !_.isObject(node.newValue)) {
      oldValue = `${indentSymbol.repeat(indentSize - 2)}${minus}${node.key}: ${node.oldValue}`;
      newValue = `${indentSymbol.repeat(indentSize - 2)}${plus}${node.key}: ${node.newValue}`;
    }

    return [
      oldValue,
      newValue,
    ].join('\n');
  }

  if (node.status === 'nested') {
    const { children } = node;
    const bracketIndent = indentSymbol.repeat(indentSize);
    const lines = children.map((child) => stringify(child, depth + 1));
    const result = [
      '{',
      ...lines,
      `${bracketIndent}}`,
    ].join('\n');
    return `${indentSymbol.repeat(indentSize - 2)}${space}${node.key}: ${result}`;
  }
  return null;
};

const stylish = (diff) => {
  const result = diff.map((child) => stringify(child, 1));
  return [
    '{',
    ...result,
    '}',
  ].join('\n');
};

export default stylish;
