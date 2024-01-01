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
                        _version
                    }
                }
            }
        `,
	});

	let accounts = result.data.listUserInfos.items;

	if (!accounts.length) {
		const userResult = await createUser(username);
		return userResult;
	} else {
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

export async function updateUser(user, username, lastQuery) {
	const result = await client.graphql({
		query: `
            mutation UpdateUserInfo {
                updateUserInfo(input: {id: "${user.id}", lastQuery: "${lastQuery}", name: "${username}", _version: ${user._version}}) {
                        _version
                        id
                        lastQuery
                        name
                    }
                }
        `,
	});

	return result.data.updateUserInfo;
}
