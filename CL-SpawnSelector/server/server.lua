local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent("CL-SpawnSelector:ModifyData", function(type, data)
    if type == "new" then
        if not data.locationData then
            print("Invalid location data received.")
            return
        end
    
        MySQL.Async.fetchAll('SELECT * FROM cl_spawnselector WHERE location_data = @locationData', {
            ['@locationData'] = json.encode(data.locationData)
        }, function(result)
            if result and #result > 0 then
                print("Location data already exists in the table.")
            else
                MySQL.Async.execute('INSERT INTO cl_spawnselector (location_data) VALUES (@locationData)', {
                    ['@locationData'] = json.encode(data.locationData)
                })
            end
        end)
    elseif type == "delete" then
        local top, left = data.top, data.left
        
        MySQL.Async.fetchAll('SELECT * FROM cl_spawnselector WHERE JSON_UNQUOTE(JSON_EXTRACT(location_data, "$.screenPosition.top")) = @top AND JSON_UNQUOTE(JSON_EXTRACT(location_data, "$.screenPosition.left")) = @left', {
            ['@top'] = top,
            ['@left'] = left
        }, function(result)
            if result and #result > 0 then
                local locationIdToDelete = result[1].id
                MySQL.Async.execute('DELETE FROM cl_spawnselector WHERE id = @locationId', {
                    ['@locationId'] = locationIdToDelete
                })
            else
                print("Location data with given top and left does not exist.")
            end
        end)
    elseif type == "colors" then
        local top, left = data.top, data.left
        local colors = data.colors
        local updateQuery = 'UPDATE cl_spawnselector SET location_data = JSON_SET(location_data'
        
        if colors.backgroundColor then
            updateQuery = updateQuery .. ', "$.backgroundColor", @backgroundColor'
        end
        if colors.Color then
            updateQuery = updateQuery .. ', "$.iconColor", @iconColor'
        end
        
        updateQuery = updateQuery .. ') WHERE JSON_UNQUOTE(JSON_EXTRACT(location_data, "$.screenPosition.top")) = @top AND JSON_UNQUOTE(JSON_EXTRACT(location_data, "$.screenPosition.left")) = @left'
        local queryParams = {
            ['@top'] = top,
            ['@left'] = left
        }
        
        if colors.backgroundColor then
            queryParams['@backgroundColor'] = colors.backgroundColor
        end
        if colors.Color then
            queryParams['@iconColor'] = colors.Color
        end
        
        MySQL.Async.execute(updateQuery, queryParams)
    elseif type == "icon" then
        local top, left = data.top, data.left
        local icon = data.icon

        MySQL.Async.execute('UPDATE cl_spawnselector SET location_data = JSON_SET(location_data, "$.iconName", @iconName) WHERE JSON_UNQUOTE(JSON_EXTRACT(location_data, "$.screenPosition.top")) = @top AND JSON_UNQUOTE(JSON_EXTRACT(location_data, "$.screenPosition.left")) = @left', {
            ['@iconName'] = icon,
            ['@top'] = top,
            ['@left'] = left
        })
    end
end)

function GetPlayerPermissions(source)
    if source then
        local Player = QBCore.Functions.GetPlayer(source)
        local hasPermission = false

        if Config.EditorPermission.UseGod and QBCore.Functions.HasPermission(Player.PlayerData.source, 'god') then
            hasPermission = true
        else
            local identifier = Player.PlayerData.citizenid
            for _, permission in pairs(Config.EditorPermission.Permissions) do
                if permission == identifier then
                    hasPermission = true
                    break
                end
            end
        end

        return hasPermission
    end
end

QBCore.Functions.CreateCallback("CL-SpawnSelector:GetInfo", function(source, cb, data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if data.type == "permissions" then
        if Player then
            cb(GetPlayerPermissions(src))
        else
            cb(false)
        end
    elseif data.type == "locations" then
        MySQL.Async.fetchAll('SELECT * FROM cl_spawnselector', {}, function(result)
            if result and #result > 0 then
                local locations = {}
                for _, locationData in ipairs(result) do
                    local locationData = json.decode(locationData.location_data)
                    table.insert(locations, locationData)
                end

                cb(locations)
            else
                cb({})
            end
        end)
    elseif data.type == "houses" then
        local cid = Player.PlayerData.citizenid
        local houses = {}
        
        if Config.Housing == "qb-housing" then
            houses = MySQL.query.await('SELECT * FROM player_houses WHERE citizenid = ?', {cid})
            if houses[1] ~= nil then
                cb(houses)
            else
                cb(nil)
            end
        elseif Config.Housing == "ps-housing" then
            houses = MySQL.query.await('SELECT * FROM properties WHERE owner_citizenid = ?', {cid})
            if houses[1] ~= nil then
                cb(houses)
            else
                cb({})
            end
        end
    end
end)