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
  const message = {
    title: 'Breaking News',
    content: 'This\'s a breaking news to all agencies.',
  }

  channel.publish('news.fanout', '', Buffer.from(JSON.stringify(message)))
}

main()