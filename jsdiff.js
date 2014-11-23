/*
 * Javascript Diff Algorithm
 * Lütfi ALTIN
 * http://github.com/laltin/jsdiff
 */

function word_split(s)
{
    if (s == "")
        return [];
        
    ws = s.split(" ");
    words = new Array();
    
    for (var i=0; i < ws.length; i++)
    {
        tokens = ws[i].split("\n"); // \n character is treated as a word
        
        if (tokens[0] != "")
            words.push( tokens[0] );
            
        for (var j=1; j < tokens.length; j++)
        {
            words.push( "\n" );
            
            if (tokens[j] != "")
                words.push( tokens[j] );
        }
    }
    
    return words;
}

function diff_words (o, n)
{
    // solve problem with same unicode char represented in different ways
    try
    {
        o = o.normalize('NFC');
        n = n.normalize('NFC');
    }
    catch(err)
    {
        // normalize method not supported in Safari
    }
    
    var changes = diff( word_split(o), word_split(n) );
    var str = "";
    
    for (var i=0; i < changes.changes.length; i++)
    {
        var newline = ( changes.text[i] == "\n" );
        
        if (changes.changes[i] < 0) // char removed
        {
            if (newline)
                str += "<del>&crarr;</del> ";
            else
                str += "<del>" + changes.text[i] + "</del> ";
        }
        else if (changes.changes[i] > 0) // char inserted
        {
            if (newline)
                str += "<ins>&crarr;</ins>\n";
            else
                str += "<ins>" + changes.text[i] + "</ins> ";
        }
        else // no change
        {
            str += changes.text[i];
            if (!newline)
                str += " ";
        }
    }
    
    // combine consecutive edits
    return str.replace(/<\/del> <del>/g, " ").replace(/<\/ins> <ins>/g, " ");
}

/*
 * compare two arrays and return diff status
 */
function diff (o, n)
{
    /*
     * detailed information about the algorithm:
     * http://en.wikipedia.org/wiki/Longest_common_subsequence_problem
     */
    var map = new Array(o.length + 1);
    for (var i=0; i < map.length; i++)
    {
        map[i] = new Array(n.length + 1);
        map[i][0] = 0; // fill first column with 0s
    }
    for (var i=0; i < map[0].length; i++)
    {
        map[0][i] = 0; // fill first row with 0s 
    }
    
    o.unshift("");
    n.unshift("");
    
    for (var i=1; i < map.length; i++)
    {
        for (var j=1; j < map[i].length; j++)
        {
            if (o[i] == n[j])
                map[i][j] = map[i - 1][j - 1] + 1;
                
            else
                map[i][j] = Math.max( map[i][j-1], map[i-1][j] );
        }
    }
    
    // prepare output
    var text = new Array();
    var changes = new Array();
    
    var i = map.length - 1;
    var j = map[0].length - 1;
    while (true)
    {
        if (i>0 && j>0 && o[i] == n[j])
        {
            text.unshift( o[i] );
            changes.unshift( 0 );
            
            i--;
            j--;
        }
        else if ( j>0 && (i==0 || map[i][j-1] >= map[i-1][j]) )
        {
            text.unshift( n[j] );
            changes.unshift( 1 );
            
            j--;
        }
        else if ( i>0 && (j==0 || map[i][j-1] < map[i-1][j]) )
        {
            text.unshift( o[i] );
            changes.unshift( -1 );
            
            i--;
        }
        else
        {
            break;
        }
    }
    
    return { text: text, changes: changes }
}
