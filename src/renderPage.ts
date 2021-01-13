import { Page } from './Page';
import { cleanHtml } from './cleanHtml';

/**
 * Ищет в указанной строке первое вхождение переданного регулярное выражения
 * и возвращает массив из двух чисел: позиции первого символа этого вхождения
 * и позиции последнего его символа плюс единица (то есть позиция следующего
 * символа после вхождения). Если же регулярное выражение в строке не найдено,
 * возвращает undefined.
 *
 * @param source Строка.
 * @param regexp Регулярное выражение.
 */
const find = (source: string, regexp: RegExp) => {
  const match = source.match(regexp);

  if (match == null) {
    return undefined;
  }

  const { index } = match;

  if (index == null) {
    return undefined;
  }

  const { length } = match[0];

  return [index, index + length];
};

/**
 * Вставляет указанную подстроку на переданную позицию исходной строки.
 *
 * @param source Исходная строка.
 * @param index Позиция вставки.
 * @param value Подстрока.
 */
const insert = (source: string, index: number, value: string) => {
  if (index < 0) {
    return source;
  }

  const head = source.substr(0, index);
  const tail = source.substr(index);

  return `${head}${value}${tail}`;
};

/**
 * Вставляет указанную строку перед первым символом вхождения регулярного
 * выражения в исходную строку.
 *
 * @param source Исходная строка.
 * @param regexp Регулярное выражение.
 * @param value Строка.
 */
const insertBefore = (source: string, regexp: RegExp, value: string) => {
  if (value === '') {
    return source;
  }

  const indexes = find(source, regexp);
  return indexes ? insert(source, indexes[0], value) : source;
};

/**
 * Вставляет указанную строку на перед последним символом вхождения
 * регулярного выражения в исходную строку.
 *
 * @param source Исходная строка.
 * @param regexp Регулярное выражение.
 * @param value Строка.
 */
const insertAtLast = (source: string, regexp: RegExp, value: string) => {
  if (value === '') {
    return source;
  }

  const indexes = find(source, regexp);
  return indexes ? insert(source, indexes[1] - 1, value) : source;
};

/**
 * Вставляет указанную строку после первого вхождения регулярного
 * выражения в исходную строку.
 *
 * @param source Исходная строка.
 * @param regexp Регулярное выражение.
 * @param value Строка.
 */
const insertAfter = (source: string, regexp: RegExp, value: string) => {
  if (value === '') {
    return source;
  }

  const indexes = find(source, regexp);
  return indexes ? insert(source, indexes[1], value) : source;
};

/**
 * Генерирует итоговый код указанной HTML-страницы.
 *
 * @param page Представление страницы.
 */
export const renderPage = async (page: Page) => {
  let { base: content } = page;

  content = insertAtLast(content, /<html\b[^>]*>/i, page.htmlAttributes);
  content = insertAtLast(content, /<body\b[^>]*>/i, page.bodyAttributes);
  content = insertBefore(content, /<\/head>/i, page.head);
  content = insertBefore(content, /<\/body>/i, page.body);

  content = await cleanHtml(content);

  const ids = Object.keys(page.nodes);
  const { length } = ids;

  for (let i = 0; i < length; i += 1) {
    const id = ids[i];
    const html = page.nodes[id];

    const pattern = `<div\\b.*?\\bid\\s*=\\s*['"]${ids[i]}['"][^>]*>`;
    const regexp = new RegExp(pattern, 'i');
    content = insertAfter(content, regexp, html);
  }

  return content;
};
