# mikro-client

Esta biblioteca, escrita en TypeScript y también compatible con JavaScript, proporciona una conexión simple a través de sockets TCP para enviar y recibir comandos de línea de comandos de MikroTik. Con esta biblioteca, puede controlar y obtener información de un dispositivo MikroTik de forma sencilla y rápida.

Version de documentación en:
- [English](https://github.com/jjjjose/mikro-client/blob/main/README.md "English")
- [Spanish](https://github.com/jjjjose/mikro-client/blob/main/README-es.md "Spanish")

## Installation

```bash
npm install mikro-client
```
o
```bash
yarn add mikro-client
```

## Uso

Para usar la clase, primero debe importarla en su proyecto:

```typescript
import { MikroClient } from 'mikro-client'
```

Luego, puede crear una nueva instancia de la clase proporcionando las opciones de configuración necesarias:

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

Una vez que tenga una instancia de la clase, puede usar el método "talk" para enviar comandos de MikroTik al dispositivo y recibir la respuesta

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

También puede especificar el tipo de respuesta que desea recibir usando el argumento opcional "type":

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

## Ejemplos

  Aquí hay algunos ejemplos de comandos de MikroTik que puede enviar usando el método "talk":

  - Obtener información de la interfaz de red:

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

  - Agregar una regla de firewall:

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

  - Obtener información de usuario conectado:

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

  - Crear un usuario de hotspot:

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

### Información

Para obtener más información sobre los comandos de MikroTik que puede enviar usando la clase MikroApi, le recomendamos consultar la documentación de MikroTik, que está disponible en el siguiente enlace:

- [API - RouterOS - MikroTik Documentation](https://help.mikrotik.com/docs/display/ROS/API)

En esta página, encontrará una lista completa de los comandos de MikroTik disponibles y sus respectivos parámetros. También encontrará ejemplos de cómo usar estos comandos en la línea de comandos y la API de MikroTik.

Espero que esto le ayude a obtener más información sobre los comandos de MikroTik y cómo usarlos con la clase MikroApi. Si tiene alguna pregunta adicional, no dude en preguntar.

---

### License

[MIT](https://github.com/jjjjose/mikro-client/blob/main/LICENSE)

Created by [jjjjose](https://github.com/jjjjose 'jjjjose') - 2022
