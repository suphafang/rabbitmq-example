import amqp from 'amqplib'

const queues = ['cnn.sport', 'cnn.politics', 'bbc.sport', 'bbc.politics']

async function connect() {
  const connection = await amqp.connect('amqp://localhost')
  const channel = await connection.createChannel()

  await channel.assertExchange('news.headers', 'headers', { durable: true })
  Promise.all(queues.map(async (queue) => await channel.assertQueue(queue, { durable: true })))
  Promise.all(
    queues.map(async (queue) => await channel.bindQueue(
      queue,
      'news.headers',
      '',
      {
        'x-match': 'all',
        'agency': queue.split('.')[0],
        'categoly': queue.split('.')[1]
      }
    ))
  )

  return channel
}

async function main() {
  const channel = await connect()

  Promise.all(queues.map(async (queue) => channel.consume(
    queue,
    msg => console.log({
      to: queue,
      message: JSON.parse(msg.content.toString())
    }),
    { noAck: true }
  )))
}

main()
