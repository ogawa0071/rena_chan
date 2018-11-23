require 'sinatra'
require 'line/bot'

def client
  @client ||= Line::Bot::Client.new { |config|
    config.channel_secret = ENV["LINE_CHANNEL_SECRET"]
    config.channel_token = ENV["LINE_CHANNEL_TOKEN"]
  }
end

post '/callback' do
  body = request.body.read
  logger.info body

  signature = request.env['HTTP_X_LINE_SIGNATURE']
  unless client.validate_signature(body, signature)
    error 400 do 'Bad Request' end
  end

  events = client.parse_events_from(body)

  events.each { |event|
    case event
    when Line::Bot::Event::Message
      case event.type
      when Line::Bot::Event::MessageType::Text
        case event.message['text']
        when 'それな'
          message = {
            type: 'text',
            text: 'いまのそれな言いたかったー！'
          }
        when /ね\Z|な\Z|ね？\Z/
          message = {
            type: 'text',
            text: 'それな'
          }
        end
      when Line::Bot::Event::MessageType::Sticker
        case event.message['packageId']
        when '1002897'
          message = {
            type: 'text',
            text: 'ありさだー！'
          }
        end
      end

      if message
        client.reply_message(event['replyToken'], message)
      end
    end
  }

  "OK"
end
