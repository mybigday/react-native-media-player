require 'json'
pjson = JSON.parse(File.read('package.json'))

Pod::Spec.new do |s|

  s.name            = "RNMediaPlayer"
  s.version         = pjson["version"]
  s.homepage        = "https://github.com/mybigday/react-native-media-player"
  s.summary         = pjson["description"]
  s.license         = pjson["license"]
  s.author          = { "Pepper Yen" => "pepper.yen@gmail.com" }

  s.ios.deployment_target = '9.0'

  s.source          = { :git => "https://github.com/mybigday/react-native-media-player.git", :tag => "v#{s.version}" }
  s.source_files   = 'ios/RNMediaPlayer/*.{h,m}'

  s.dependency 'React'
end
