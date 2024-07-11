import amqp from 'amqplib'

const topics = ['cnn.sport', 'cnn.politics', 'bbc.sport', 'bbc.politics']

async function connect() {
  const connection = await amqp.connect('amqp://localhost')
  const channel = await connection.createChannel()

  await channel.assertExchange('news.topic', 'topic', { durable: true })
  Promise.all(topics.map(async (topic) => await channel.assertQueue(topic, { durable: true })))
  Promise.all(
    topics
      .filter((topic) => topic.endsWith('.sport'))
      .map(async (topic) => await channel.bindQueue(topic, 'news.topic', '*.sport')),
    topics
      .filter((topic) => topic.endsWith('.politics'))
      .map(async (topic) => await channel.bindQueue(topic, 'news.topic', '*.politics'))
  )

  return channel
}

async function main() {
  const channel = await connect()
  const message = {
    title: 'Sport News to BBC',
    content: 'This\'s a sport news to BBC.',
  }

  channel.publish('news.topic', 'bbc.sport', Buffer.from(JSON.stringify(message)))
}

main()