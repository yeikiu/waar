module.exports = {

    ////////////////////////////////////////////////////////////////
    // GENERAL SETTINGS
    ////////////////////////////////////////////////////////////////

    // Data directory is used so that we can persist cookies per session and not have to
    // authorize this application every time.
    // NOTE: This directory can get quite large overtime, in that case simply delete it
    // and re-authorize Whatsapp.
    data_dir: '_tmp',
    
    // When true, Chrome browser window will be shown. When false, it will be hidden	
    window: false,
    
    min_minutes_between_messages: 5, // minutes

    check_interval_seconds: 25 // seconds
}