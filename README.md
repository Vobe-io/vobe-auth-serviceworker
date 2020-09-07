# **VOBE AUTH SERVICE**

## Token

The session token is stored in the localStorage under the key `session-token`

## Login / SignIn

```ts
const auth = new Auth({}); // Props are not implemented yet
auth
  .signin({
    username: 'user123',
    password: 'password123',
  }) // returns Promise<AuthStatus>
  .then((res) => console.log('SUCCESS: ', res)) // Auth successfull
  .catch((err) => console.log('ERROR: ', err)) // Auth error
  .finally(() => console.log('=== END ===')); // Clean up, etc..
```

## Register / SignUp

```ts
const auth = new Auth({});

auth
  .signup({
    username: 'username123',
    email: 'email@mail.com',
    password: 'password123',
  }) // returns Promise<AuthStatus>
  .then((res) => console.log('SUCCESS: ', res)) // Auth successfull
  .catch((err) => console.log('ERROR: ', err)) // Auth error
  .finally(() => console.log('=== END ===')); // Clean up, etc..
```

## State mangment

The auth service has a State mangment implemented \

### States

- `IDLE` Waiting for an login/register, basically doing nothing
- `AWAITING` Waiting for an answer from the backend
- `SUCCESS` Answer recieved
- `FAILED` Request failed

Normal state cycle: \
`IDLE --> AWAITING --> SUCCESS/FAILED --> IDLE`

### Register Listener

```ts
const auth = new Auth({});

// login (see abouve)

auth.authStates.signin.onStateChange((old_state, new_state) => {
  console.log(`State changed from ${old_state} to ${new_state}`);
});
```
