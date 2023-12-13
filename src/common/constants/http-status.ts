/* eslint-disable lines-between-class-members */
// eslint-disable-next-line import/prefer-default-export
export class HttpStatus {
  // 2×× SUCCESS
  public static OK = 200;
  public static CREATED = 201;

  // 4×× CLIENT ERROR
  public static BAD_REQUEST = 400;
  public static FORBIDDEN = 403;
  public static NOT_FOUND = 404;
  public static UNPROCESSABLE_ENTITY = 422;

  // 5×× SERVER ERROR
  public static INTERNAL_SERVER_ERROR = 500;
}
