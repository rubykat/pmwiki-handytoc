<?php if (!defined('PmWiki')) exit();
/*
 * Copyright 2006 Kathryn Andersen
 * 
 * This program is free software; you can redistribute it and/or modify it
 * under the Gnu Public Licence or the Artistic Licence.
 */ 

/** \file handytoc.php
 * \brief JavaScript Table of Contents
 *
 * See Also: http://www.pmwiki.org/wiki/Cookbook/HandyToc
 */
$RecipeInfo['HandyTableOfContents']['Version'] = '20070217';

SDV($HandyTocPubDirUrl, '$FarmPubDirUrl/handytoc');
SDV($HandyTocStartAt, 1);
SDV($HandyTocEndAt, 6);
SDV($HandyTocIgnoreSoleH1, 'true');

Markup("handytoc", "directives", 
  "/\\(:htoc\s*(.*):\\)/e", 
  "HandyTocProcessMarkup(\$pagename, '$1')");

$HTMLHeaderFmt['handytoc'] = 
   "<link rel='stylesheet' href='\$HandyTocPubDirUrl/handytoc.css' 
     type='text/css' />\n";

function HandyTocProcessMarkup($pagename, $argstr) {
    global $HandyTocEndAt, $HandyTocStartAt, $HandyTocIgnoreSoleH1;
    global $HTMLFooterFmt;
    $args = ParseArgs($argstr);
    $title = ($args[''] ? implode(' ', $args['']) : '');
    $start = ($args['start'] ? $args['start'] : $HandyTocStartAt);
    $end = ($args['end'] ? $args['end'] : $HandyTocEndAt);
    $ignoreh1 = ($args['ignoreh1'] ? $args['ignoreh1'] : $HandyTocIgnoreSoleH1);
    $class = ($args['class'] ? ' class="' . $args['class'] . '" ' : '');
    $HTMLFooterFmt['handytoc'] = " 
  <script language='javascript' type='text/javascript'
     src='\$HandyTocPubDirUrl/handytoc.js'></script>
  <script language='javascript' type='text/javascript'>TOC.set_args({start:$start, end:$end, ignoreh1:$ignoreh1});</script>
";
    if ($title)
    {
	return Keep("<div ${class}id='htoc'><h3>$title</h3></div>");
    }
    else
    {
	return Keep("<div ${class}id='htoc'></div>");
    }

}

?>
