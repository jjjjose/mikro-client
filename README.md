# mikro-client

This library, written in TypeScript and also compatible with JavaScript, provides a simple connection via TCP sockets to send and receive command-line commands from MikroTik. With this library, you can easily and quickly control and get information from a MikroTik device.

version documentation in:
- <a href="https://github.com/jjjjose/mikro-client/blob/main/README.md " target="_blank">English</a>
- <a href="https://github.com/jjjjose/mikro-client/blob/main/README-es.md " target="_blank">Spanish</a>
## Installation

```bash
npm install mikro-client
```
or
```bash
yarn add mikro-client
```

## Usage

To use the class, you must first import it into your project:

```typescript
import { MikroClient } from 'mikro-client'
```

Then, you can create a new instance of the class by providing the necessary configuration options:

```typescript
const options = {
  host: 'XXX.XXX.XXX.XXX',
  port: XXXX,
  username: 'xxxxx',
  password: 'xxxxx',
  timeout: 5000,
}
const mikro = new MikroClient(options)
```

Once you have an instance of the class, you can use the "talk" method to send MikroTik commands to the device and receive the response:

```typescript
const response = await mikro
  .talk(['/interface/print'])
  .then((response) => {
    console.log(response)
  })
  .catch((error) => {
    console.error(error)
  })
```

You can also specify the type of response you want to receive using the optional "type" argument:

```typescript
const response = await mikro
  .talk(['/interface/print'], 'object')
  .then((response) => {
    console.log(response)
  })
  .catch((error) => {
    console.error(error)
  })
```

## Examples

  Here are some examples of MikroTik commands that you can send using the "talk" method:

  - Get network interface information:

  ```typescript
  const response = await mikro
    .talk(['/interface/print'])
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.error(error)
    })
  ```

  - Add a firewall rule:

  ```typescript
  mikro
    .talk([
      '/ip/firewall/filter/add',
      '=chain=forward',
      '=protocol=tcp',
      '=dst-port=80',
      '=action=accept',
    ])
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.error(error)
    })
  ```

  - Get connected user information:

  ```typescript
  mikro
    .talk(['/ip/hotspot/active/print'])
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.error(error)
    })
  ```

  - Create a hotspot user:

  ```typescript
  mikro
    .talk([
      '/ip/hotspot/user/add',
      '=name=example',
      '=password=example',
      '=profile=default',
    ])
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.error(error)
    })
  ```

### Information

For more information on the MikroTik commands that you can send using the MikroApi class, we recommend consulting the MikroTik documentation, which is available at the following link:

- <a href="https://help.mikrotik.com/docs/display/ROS/API" target="_blank">API - RouterOS - MikroTik Documentation</a>

On this page, you will find a complete list of available MikroTik commands and their respective parameters. You will also find examples of how to use these commands in the MikroTik command line and API.

I hope this helps you get more information on MikroTik commands and how to use them with the MikroApi class. If you have any additional questions, don't hesitate to ask.

---

### License

- <a href="https://github.com/jjjjose/mikro-client/blob/main/LICENSE" target="_blank">MIT</a>
- ---

Created by <a href="https://github.com/jjjjose" target="_blank">jjjjose</a> - 2022
