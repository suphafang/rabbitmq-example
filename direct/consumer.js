import amqp from 'amqplib'

async function connect() {
  const connection = await amqp.connect('amqp://localhost')
  const channel = await connection.createChannel()

  await channel.assertExchange('news.direct', 'direct', { durable: true })
  await channel.assertQueue('cnn', { durable: true })
  await channel.assertQueue('bbc', { durable: true })
  await channel.bindQueue('cnn', 'news.direct', 'cnn')
  await channel.bindQueue('bbc', 'news.direct', 'bbc')

  return channel
}

async function main() {
  const channel = await connect()

  channel.consume(
    'cnn',
    msg => console.log({ 
      to: 'CNN', 
      message: JSON.parse(msg.content.toString()) 
    }),
    { noAck: true }
  )
  channel.consume(
    'bbc',
    msg => console.log({ 
      to: 'BBC', 
      message: JSON.parse(msg.content.toString()) 
    }),
    { noAck: true }
  )
}

main()
