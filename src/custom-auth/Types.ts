import {securityId} from '@loopback/security';

/**
 * Credentials used in login
 *
 * Used in:
 * - `UserLoginService`'s declaration
 * - `UserLoginService.verifyCredentials`
 * - `[Login controller].[Login request handler]`
 */
export type Credentials = {
  username: string;
  password: string;
}

/**
 * Credentials OpenAPI Schema
 *
 * Used in:
 * - `CredentialsRequestBody`
 */
export const CredentialsSchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

/**
 * Loopback Credentials' RequestBody
 *
 * Used in:
 * - `[Login controller].[Login request handler]`
 */
export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

/**
 * User profile custom type.
 *
 * Used in:
 * - `JWTService.generateToken`
 * - `[Login controller].[Whoami request functions/handlers]`
 *
 * Returned in:
 * - `JWTService.verifyToken`
 * - `UserLoginService.convertToUserProfile`
 */
export type ReturnUser = {
  username: string
  [securityId]: string
}
