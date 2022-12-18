import { Socket } from 'net'

export class MikroClient {
  private sk: Socket
  private host: string
  private port: number
  private username: string
  private password: string
  private timeout: number
  private loged: boolean = false

  constructor(options?: {
    host?: string
    port?: number
    username?: string
    password?: string
    timeout?: number
  }) {
    // initialize properties
    this.host = options?.host || '192.168.88.1'
    this.port = options?.port || 8728
    this.username = options?.username || 'admin'
    this.password = options?.password || ''
    // por defecto el timeout es de 3 segundos osea espera 5 segundos para recibir la dataBUFFER
    this.timeout = options?.timeout || 3000
    this.sk = new Socket()
    // inicializar el socket
    this.sk.connect(this.port, this.host)
  }

  // metodo para loguear al mikrotik
  private async login(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const resp: any = this.writeSentence([
          '/login',
          `=name=${this.username}`,
          `=password=${this.password}`,
        ])
        if (resp.tag === '!trap') {
          this.loged = false
          resolve(false)
        }
        this.loged = true
        resolve(true)
      } catch (error) {
        this.loged = false
        reject('Error al loguear: ' + error)
      }
    })
  }

  // metodo para enviar las sentencias nativas de mikrotik
  public talk(words: string[], type?: string) {
    return new Promise(async (resolve, reject) => {
      // loguear al mikrotik

      if ((await this.login()) && this.loged) {
        // esperar medio segundo para enviar la data
        setTimeout(async () => {
          // si no se envia nada retorna un array vacio y  emitir un error
          if (this.writeSentence(words) === 0) {
            reject(' No se envio nada...')
          }
        }, 500)

        const data = await this.readSentence()
        if (!data) {
          reject('No se recibio nada de data...')
        }
        if (type === 'object') {
          resolve(this.toObj(data.data))
        }
        this.close()
        resolve(data.data)
      } else {
        reject('Error al loguear...')
      }
    })
  }

  // metodo para convertir la data en un objeto mas facil de manejar
  private toObj(data: string[]): any[] {
    // eliminar los strings vacios del array y los arrays con !done
    let arrayData: string[] = data.filter(
      (e) => e !== '' && !e.includes('!done')
    )
    // dividir el array en mas arrays cada que haya un string con la palabra !re
    const arr: string[][] = arrayData.reduce(
      (acc: string[][], curr: string) => {
        // agregar un nuevo array a acc si curr incluye !re, de lo contrario no hacer nada
        curr.includes('!re') ? acc.push([]) : null
        // concatenar curr al último elemento de acc
        acc[acc.length - 1] = [...acc[acc.length - 1], curr]
        return acc
      },
      [[]]
    )
    // eliminar el primer elemento vacío de arr
    arr.shift()

    // convertir cada array en un objeto
    return arr.map((a) => {
      // eliminar los elementos que no contienen el carácter = y eliminar el carácter = de cada elemento
      a = a.filter((e) => e.includes('=')).map((e) => e.replace('=', ''))
      // convertir el array en un objeto
      return a.reduce((acc: { [key: string]: string }, curr: string) => {
        // asignar el valor de curr a la propiedad correspondiente del objeto acc
        let [key, value] = curr.split('=')
        // si la key es .id, quitar el . y quitar su asterisco del value
        if (key === '.id') {
          key = 'id'
          value = value.replace('*', '')
        }
        // convertir la key en camelCase si tine guion medio
        key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        // convertir en int o float la propiedad value si es posible
        value = isNaN(Number(value)) ? value : (Number(value) as any)
        //convertir en booleano la propiedad value si es posible
        value =
          value === 'true' ? true : value === 'false' ? false : (value as any)

        return { ...acc, [key]: value }
      }, {})
    })
  }

  // metodo para leer las sentencias del mikrotik
  private async readSentence(): Promise<{
    tag: string
    data: string[]
  }> {
    const data = await this.readeBuffer()
    const decoded = this.decodeBuffer(data)
    let data2 = {
      tag: decoded[0],
      data: decoded.slice(1),
    }
    return data2
  }

  // metodo para leer las respuestas del mikrotik en formato buffer retorna una promesa
  private readeBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // varaiable para almacenar el buffer
      let buffer: Buffer = Buffer.alloc(0)
      // evento que se dispara cuando se recibe data
      this.sk.on('data', (data: Buffer) => {
        // se concatena el buffer con la data recibida
        buffer = Buffer.concat([buffer, data])
      })

      // esperar 5 segundos para que se reciba la data
      setTimeout(() => {
        // si el buffer esta vacio se rechaza la promesa
        if (buffer.length === 0) {
          reject(new Error('No se recibio data'))
        }
        // si el buffer tiene data se resuelve la promesa
        resolve(buffer)
      }, this.timeout)
    })
  }

  //decodificador de buffer, convierte en un array de strings las respuestas que envia el router
  private decodeBuffer(buff: Buffer): string[] {
    const data = []
    // leer el buffer el primer byte es el length
    let idx = 0
    while (idx < buff.length) {
      let len
      let b = buff[idx++]
      len =
        b & 128
          ? (b & 192) == 128
            ? ((b & 63) << 8) + buff[idx++]
            : (b & 224) == 192
            ? (((b & 31) << 8) + buff[idx++]) << (8 + buff[idx++])
            : (b & 240) == 224
            ? ((((b & 15) << 8) + buff[idx++]) << (8 + buff[idx++])) <<
              (8 + buff[idx++])
            : b
          : b
      data.push(buff.slice(idx, idx + len).toString('utf8'))
      idx += len
    }

    return data
  }

  private writeSentence(words: string[]): number {
    // si no extiste el string login entre en array de palabras
    let ret = 0
    if (this.loged || words.includes('/login')) {
      for (const word of words) {
        // escribe el length(largo) de la palabra
        this.writeLen(Buffer.byteLength(word))
        // escribe la palabra al socket
        this.sk.write(word, 'utf-8')
        ret += 1
      }
      // escribe el length de la palabra vacia para indicar el final de la frase o sentence
      this.writeLen(0)

      return ret
    }
    return ret
  }

  private writeLen(length: number): void {
    const buffer = this.getVarIntBuffer(length)
    this.sk.write(buffer)
  }

  private getVarIntBuffer(length: number): Buffer {
    const byteCount = this.getVarIntByteCount(length)
    const buffer = Buffer.alloc(byteCount)
    for (let i = 0; i < byteCount; i++) {
      buffer[i] = (length >>> (8 * i)) & 0xff
    }
    return buffer
  }

  private getVarIntByteCount(length: number): number {
    if (length < 0x80) return 1
    if (length < 0x4000) return 2
    if (length < 0x200000) return 3
    if (length < 0x10000000) return 4
    return 5
  }
  // metodo para cerrar la conexion y liberar el socket y la memoria y el puerto y todo
  private close(): void {
    this.sk.destroy()
  }
}
