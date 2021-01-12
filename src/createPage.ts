import { Page } from './Page';

/**
 * Создаёт представление HTML-страницы, пригодное для редактирования.
 *
 * @param html Исходный код страницы.
 */
export const createPage = (html: string): Page => ({
  htmlAttributes: '',
  bodyAttributes: '',
  body: '',
  head: '',
  nodes: {},
  base: html,
});
