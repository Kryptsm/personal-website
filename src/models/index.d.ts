import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection } from "@aws-amplify/datastore";





type EagerRestaurant = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Restaurant, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly Meals?: (Meal | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyRestaurant = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Restaurant, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly Meals: AsyncCollection<Meal>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Restaurant = LazyLoading extends LazyLoadingDisabled ? EagerRestaurant : LazyRestaurant

export declare const Restaurant: (new (init: ModelInit<Restaurant>) => Restaurant) & {
  copyOf(source: Restaurant, mutator: (draft: MutableModel<Restaurant>) => MutableModel<Restaurant> | void): Restaurant;
}

type EagerMeal = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Meal, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly date: string;
  readonly restaurantID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMeal = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Meal, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly date: string;
  readonly restaurantID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Meal = LazyLoading extends LazyLoadingDisabled ? EagerMeal : LazyMeal

export declare const Meal: (new (init: ModelInit<Meal>) => Meal) & {
  copyOf(source: Meal, mutator: (draft: MutableModel<Meal>) => MutableModel<Meal> | void): Meal;
}