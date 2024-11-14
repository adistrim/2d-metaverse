const axios = require('axios');

const BACKEND_URL = "http://localhost:3000";

describe("Authentication", () => {
    test('User is able to sign up only once', async () => {
        const username = "adistrim" + Math.random();
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username, 
            password,
            type: "admin"
        })

        expect(response.status).toBe(200);

        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username, 
            password,
            type: "admin"
        })

        expect(updatedResponse.status).toBe(400);
    });

    test('Signup request fails if the username is empty', async () => {
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            password
        })

        expect(response.status).toBe(400);
    });

    test('Signin succeeds with correct credentials', async () => {
        const username = `adistrim${Math.random()}`;
        const password = "123456";

        axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username, 
            password
        });

        const response = axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username, 
            password
        });

        expect(response.status).toBe(200);
        expect(response.data.token).not.toBe(undefined);

    });

    test('Signin fails with incorrect credentials', async () => {
        const username = `adistrim${Math.random()}`;
        const password = "123456";

        axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username, 
            password
        });

        const response = axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username: "test0000001", // wrong username
            password: "1234567" // wrong passord
        });

        expect(response.status).toBe(403); // 403 Forbidden - Unauthorized
    });
})

describe("User Information Endpoints", () => {

    let token = "";
    let avatarId = "";

    beforeAll(async () => {
        const username = `adistrim${Math.random()}`;
        const password = "1234567890abcdef";

        await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username, 
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username, 
            password
        })

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        avatarId = avatarResponse.data.avatarId;
    });

    test('User cannot update their metadata with a wrong avatar id', async () => {
        const response = await axios.put(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "wrong-avatar-id"
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        expect(response.status).toBe(400);
    })

    test('User can update their metadata with a correct avatar id', async () => {
        const response = await axios.put(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        expect(response.status).toBe(200);
    })

    test('User cannot update their metadata if auth header is not present', async () => {
        const response = await axios.put(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        });

        expect(response.status).toBe(200);
    })
})

describe("User Avatar Information", () => {
    let avatarId = "";
    let token = "";
    let userId = "";

    beforeAll(async () => {
        const username = `adistrim${Math.random()}`;
        const password = "1234567890abcdef";

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username, 
            password,
            type: "admin"
        });

        userId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username, 
            password
        })

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        avatarId = avatarResponse.data.avatarId;
    });

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?id=[${userId}]`);

        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars list the recently created avatar", async() => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);

        expect(response.data.avatars.length).not.toBe(0);

        const currentAvatar = response.data.avatars.find(avatar => avatar.avatarId === avatarId);
        expect(currentAvatar).toBeDefined();
    })
});


