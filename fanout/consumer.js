import amqp from 'amqplib'

async function connect() {
  const connection = await amqp.connect('amqp://localhost')
  const channel = await connection.createChannel()

  await channel.assertExchange('news.fanout', 'fanout', { durable: true })
  await channel.assertQueue('cnn', { durable: true })
  await channel.assertQueue('bbc', { durable: true })
  await channel.bindQueue('cnn', 'news.fanout', '')
  await channel.bindQueue('bbc', 'news.fanout', '')

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
