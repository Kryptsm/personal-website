/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getRestaurant = /* GraphQL */ `
  query GetRestaurant($id: ID!) {
    getRestaurant(id: $id) {
      id
      name
      Meals {
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const listRestaurants = /* GraphQL */ `
  query ListRestaurants(
    $filter: ModelRestaurantFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRestaurants(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncRestaurants = /* GraphQL */ `
  query SyncRestaurants(
    $filter: ModelRestaurantFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncRestaurants(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getMeal = /* GraphQL */ `
  query GetMeal($id: ID!) {
    getMeal(id: $id) {
      id
      name
      date
      restaurantID
      coreName
      side
      isLeftovers
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const listMeals = /* GraphQL */ `
  query ListMeals(
    $filter: ModelMealFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMeals(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        date
        restaurantID
        coreName
        side
        isLeftovers
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncMeals = /* GraphQL */ `
  query SyncMeals(
    $filter: ModelMealFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncMeals(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        date
        restaurantID
        coreName
        side
        isLeftovers
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const mealsByRestaurantID = /* GraphQL */ `
  query MealsByRestaurantID(
    $restaurantID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMealFilterInput
    $limit: Int
    $nextToken: String
  ) {
    mealsByRestaurantID(
      restaurantID: $restaurantID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        date
        restaurantID
        coreName
        side
        isLeftovers
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
