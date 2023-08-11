/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateRestaurant = /* GraphQL */ `
  subscription OnCreateRestaurant(
    $filter: ModelSubscriptionRestaurantFilterInput
  ) {
    onCreateRestaurant(filter: $filter) {
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
export const onUpdateRestaurant = /* GraphQL */ `
  subscription OnUpdateRestaurant(
    $filter: ModelSubscriptionRestaurantFilterInput
  ) {
    onUpdateRestaurant(filter: $filter) {
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
export const onDeleteRestaurant = /* GraphQL */ `
  subscription OnDeleteRestaurant(
    $filter: ModelSubscriptionRestaurantFilterInput
  ) {
    onDeleteRestaurant(filter: $filter) {
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
export const onCreateMeal = /* GraphQL */ `
  subscription OnCreateMeal($filter: ModelSubscriptionMealFilterInput) {
    onCreateMeal(filter: $filter) {
      id
      name
      date
      restaurantID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onUpdateMeal = /* GraphQL */ `
  subscription OnUpdateMeal($filter: ModelSubscriptionMealFilterInput) {
    onUpdateMeal(filter: $filter) {
      id
      name
      date
      restaurantID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onDeleteMeal = /* GraphQL */ `
  subscription OnDeleteMeal($filter: ModelSubscriptionMealFilterInput) {
    onDeleteMeal(filter: $filter) {
      id
      name
      date
      restaurantID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
