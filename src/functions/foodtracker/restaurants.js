import * as queries from "../../graphql/queries";
import { API } from "aws-amplify";

export async function listRestaurants() {
	const result = await API.graphql({ query: queries.listRestaurants });
	console.log(result);
}
