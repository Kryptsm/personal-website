import { generateClient } from "aws-amplify/api";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
const client = generateClient();

export async function fetchUser() {
	const { username } = await getCurrentUser();

	const { tokens: session } = await fetchAuthSession();

	const result = await client.graphql({
		query: `
            query fetchUserInfo {
                listUserInfos(filter: {name: {eq: "${username}"}, _deleted: {ne: true}}) {
                    items {
                        id
                        name
                        lastQuery
                    }
                }
            }
        `,
	});

	let accounts = result.data.listUserInfos.items;

	if (!accounts.length) {
		const userResult = await createUser(username);
		console.log("userInfo: ", userResult);
		return userResult;
	} else {
		console.log("userInfo: ", accounts[0]);
		return accounts[0];
	}
}

export async function createUser(username) {
	const result = await client.graphql({
		query: `
            mutation CreateUserInfo {
                createUserInfo(input: {name: "${username}"}) {
                    id
                    lastQuery
                    name
                }
            }
        `,
	});

	return result.data.createUserInfo;
}
