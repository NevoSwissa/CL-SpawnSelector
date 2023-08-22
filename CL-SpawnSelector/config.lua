Config = {}

Config.Housing = "qb-housing" -- Your housing script, currently supported by qb-housing & ps-housing.

Config.ServerLogo = "https://cdn.discordapp.com/attachments/967914093396774942/1135166511804338206/YOUR_RP_LOGO.png" -- Your server logo URL

Config.ScriptStyle = "light" -- The style you would like the script to be, available options are : light, dark, natural. If not light then the auto switch between dark and light will be stop.

Config.EditorPermission = {
    UseGod = false, -- Whether or not you want to allow every god admin to access the editor.
    Permissions = { -- Add to the table citizenids to have permission to the editor.
        "CITIZENID",
    },
}

Config.CameraSettings = {
    SkyCamera = {
        ZPlus = 1500, -- The height value you would like the camera to be positioned at.
    },
}

Config.Houses = { -- This are the configuration available for the houses locations.
    LocationInfo = { -- The location info, colors etc.
        IconName = "fas fa-bed",
        Colors = { -- The colors data, can be hsl, hex rgb etc.
            IconColor = "#000000",
            BackgroundColor = "#FFBEBA",
        },
    },
}

Config.Locations = { -- After creating the locations in the editor you need to set-up the location image and coords for that location here.
    ["MRPD"] = { -- The location name the image and coords would be assigned to.
        Radius = 20.0, -- The radius of which the script will check for people.
        Coords = vector4(431.88574, -986.3361, 30.710439, 0.8176308), -- The coords the player would get spawned at.
        ImageURL = "https://cdn.discordapp.com/attachments/967914093396774942/1141874211216965672/image.png", -- The imageURL that is going to be displayed in the UI.
    },
    ["Hospital"] = {
        Radius = 20.0,
        Coords = vector4(294.60711, -596.166, 43.279071, 68.643562),
        ImageURL = "https://cdn.discordapp.com/attachments/967914093396774942/1141874892107681962/image.png",
    },
    ["Legion Square"] = {
        Radius = 20.0,
        Coords = vector4(202.09446, -946.9437, 30.691785, 58.586837),
        ImageURL = "https://cdn.discordapp.com/attachments/967914093396774942/1141875155514175589/image.png",
    },
    ["Airport"] = {
        Radius = 20.0,
        Coords = vector4(-1037.826, -2737.916, 20.169267, 324.06866),
        ImageURL = "https://cdn.discordapp.com/attachments/967914093396774942/1141875726757396610/image.png",
    },
    ["Mount Chiliad"] = {
        Radius = 20.0,
        Coords = vector4(501.50012, 5603.7133, 797.91052, 174.66842),
        ImageURL = "https://cdn.discordapp.com/attachments/967914093396774942/1141876256443482255/image.png",
    },
    ["Military Base"] = {
        Radius = 20.0,
        Coords = vector4(-2052.345, 3170.4316, 32.810302, 152.56065),
        ImageURL = "https://cdn.discordapp.com/attachments/967914093396774942/1141876256443482255/image.png",
    },
}
