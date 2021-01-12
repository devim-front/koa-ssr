import { Context } from 'koa';

/**
 * Сохраняет переданное значение в указанный контекст запроса по заданному
 * уникальному ключу.
 *
 * @param context Контекст запроса Koa.
 * @param key Уникальный ключ.
 * @param value Значение или `undefined`, если указанный ключ должен быть
 * удалён из контекста запроса.
 */
export const setContextValue = <T = any>(
  context: Context,
  key: string | Symbol,
  value?: T
) => {
  if (value === undefined) {
    // @ts-ignore
    delete context.state[key];
  } else {
    // @ts-ignore
    context.state[key] = value;
  }
};
