import {Entity, model, property} from '@loopback/repository';
import {securityId, UserProfile} from '@loopback/security';

export type GenderType = "MALE" | "FEMALE";

@model()
export class User extends Entity implements UserProfile {
  @property({
    type: 'number',
    id: true,
    generated: true,
    required: false
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  @property({
    type: 'string',
    required: true,
  })
  gender: GenderType;

  @property({
    type: 'date',
    required: true,
  })
  birthdate: string;

  @property({
    type: 'string',
    required: false,
  })
  email?: string;

  [securityId]: string;
  [attribute: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
