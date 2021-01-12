import { Context } from 'koa';

/**
 * Возвращает значение, сохранённое в указанном контексте запроса по заданному
 * ключу, или `undefined`, если ключ не найден.
 *
 * @param context Контекст запроса.
 * @param key Уникальный ключ.
 */
export const getContextValue = <T = any>(
  context: Context,
  key: string | Symbol
) => {
  // @ts-ignore
  return context.state[key] as T | undefined;
};
