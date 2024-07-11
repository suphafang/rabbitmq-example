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
  const message = {
    title: 'News to BBC',
    content: 'This\'s a news to BBC.',
  }

  channel.publish('news.direct', 'bbc', Buffer.from(JSON.stringify(message)))
}

main()