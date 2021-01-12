import { Page } from './Page';

/**
 * Добавляет указанный HTML-код в конец списка атрибутов тега BODY.
 *
 * @param page Представление страницы.
 * @param html Дополнительный HTML-код.
 */
export const appendBodyAttributes = (page: Page, html: string): Page => ({
  ...page,
  bodyAttributes: html ? `${page.bodyAttributes} ${html}` : page.bodyAttributes,
});
