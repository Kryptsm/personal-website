// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Restaurant, Meal } = initSchema(schema);

export {
  Restaurant,
  Meal
};