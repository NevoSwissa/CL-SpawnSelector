# CL-SpawnSelector
Simple to use spawn selector system with an advanced and modern looking user-interface.

Preview: https://youtu.be/fAdZoYl7lfQ

Light Theme :

![image](https://github.com/NevoSwissa/CL-SpawnSelector/assets/96447671/b127e8d4-ecf6-4ff5-b60a-af8d2f977e0a)

Dark Theme:

![imag3e](https://github.com/NevoSwissa/CL-SpawnSelector/assets/96447671/7b0d9069-f650-45eb-a7dc-c45c49ade843)

Natural Theme :

![image2](https://github.com/NevoSwissa/CL-SpawnSelector/assets/96447671/b556fefe-b3d4-4b0d-a9c8-312651ffc965)

# Features

- Intuitive and easy-to-use interface for players and admins.
- Auto cycle between Dark & Light during day / night time.
- Spawn editor that allows server owners to create and modify locations with ease.
- Compatible with qb-housing & ps-housing.

# Usage

DO NOT SKIP ANY STEPS !

Step 1 - General Usage

To use CL-SpawnSelector, simply drag & drop the resource after making sure the resource is called CL-SpawnSelector and not CL-SpawnSelector-main, then run the SQL table `cl_spawnselector`. After that set your server logo and permissions for the editor in `config.lua`. When creating a new location using the editor add the necessary data to the `config.lua > Config.Locations`.

Step 2 - Remove Dependecy

Remove the dependency `qb-spawn` in `qb-multicharacter` at line 36 in `fxmanifest.lua`.

Step 3 - Modify Prison

Modify the `qb-prison` resource by heading to `qb-prison > client > main.lua` search for the event `prison:client:Enter` (Line 207) and replace it with this updated event :
Additionally, you can just add `and invokingResource ~= 'CL-SpawnSelector'` to line 209.

`lua
RegisterNetEvent('prison:client:Enter', function(time)
	local invokingResource = GetInvokingResource()
	if invokingResource and invokingResource ~= 'CL-SpawnSelector' and invokingResource ~= 'qb-policejob' and invokingResource ~= 'qb-ambulancejob' and invokingResource ~= GetCurrentResourceName() then
		-- Use QBCore.Debug here for a quick and easy way to print to the console to grab your attention with this message
		QBCore.Debug({('Player with source %s tried to execute prison:client:Enter manually or from another resource which is not authorized to call this, invokedResource: %s'):format(GetPlayerServerId(PlayerId()), invokingResource)})
		return
	end

	QBCore.Functions.Notify( Lang:t("error.injail", {Time = time}), "error")

	TriggerEvent("chatMessage", "SYSTEM", "warning", "Your property has been seized, you'll get everything back when your time is up..")
	DoScreenFadeOut(500)
	while not IsScreenFadedOut() do
		Wait(10)
	end
	local RandomStartPosition = Config.Locations.spawns[math.random(1, #Config.Locations.spawns)]
	SetEntityCoords(PlayerPedId(), RandomStartPosition.coords.x, RandomStartPosition.coords.y, RandomStartPosition.coords.z - 0.9, 0, 0, 0, false)
	SetEntityHeading(PlayerPedId(), RandomStartPosition.coords.w)
	Wait(500)
	TriggerEvent('animations:client:EmoteCommandStart', {RandomStartPosition.animation})

	inJail = true
	jailTime = time
	local tempJobs = {}
	local i = 1
	for k in pairs(Config.Locations.jobs) do
		tempJobs[i] = k
		i += 1
	end
	currentJob = tempJobs[math.random(1, #tempJobs)]
	CreateJobBlip(true)
	TriggerServerEvent("prison:server:SetJailStatus", jailTime)
	TriggerServerEvent("prison:server:SaveJailItems", jailTime)
	TriggerServerEvent("InteractSound_SV:PlayOnSource", "jail", 0.5)
	CreateCellsBlip()
	Wait(2000)
	DoScreenFadeIn(1000)
	QBCore.Functions.Notify( Lang:t("error.do_some_work", {currentjob = Config.Jobs[currentJob] }), "error")
end)
`

# Contributing

Contributions are always welcome! If you find any issues or want to add new features, feel free to fork this repository and submit a pull request.

# Credits

CL-SpawnSelector was developed by CloudDevelopment the art used in the script was made by CorerMaximus. Special thanks to the FiveM community as a whole and QBCore in particular for their contributions and support.
