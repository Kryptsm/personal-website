// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { UserInfo, Restaurant, Meal } = initSchema(schema);

export {
  UserInfo,
  Restaurant,
  Meal
};