import { Page } from './Page';

/**
 * Добавляет указанный HTML-код в конец списка атрибутов тега HTML.
 *
 * @param page Представление страницы.
 * @param html Дополнительный HTML-код.
 */
export const appendHtmlAttributes = (page: Page, html: string): Page => ({
  ...page,
  htmlAttributes: html ? `${page.htmlAttributes} ${html}` : page.htmlAttributes,
});
