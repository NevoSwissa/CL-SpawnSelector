fx_version 'adamant'

game 'gta5'
lua54 'yes'
author "NevoSwissa"

ui_page 'html/index.html'

shared_script 'config.lua'

client_scripts {
    'client/client.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/server.lua',
}

files {
    'html/Images/*.png',
	'html/*',
}

dependencies {
    'oxmysql',
}