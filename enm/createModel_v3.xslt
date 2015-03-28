<?xml version="1.0" encoding="iso-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:str="http://exslt.org/strings"
xmlns:exsl="http://exslt.org/common"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
exclude-result-prefixes="om str"
xmlns:om="http://openmodeller.cria.org.br/xml/2.0">
<xsl:param name="presence_points"/>
<xsl:param name="algorithm"/>
<xsl:param name="layers"/>
<xsl:param name="mask" select="'?'"/>
<xsl:param name="spatially_unique" select="'no'"/>
<xsl:param name="environmentally_unique" select="'no'"/>
<xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes" omit-xml-declaration="no"/>

<xsl:template match="om:Environment">
   <xsl:variable name="layerlist" select='str:tokenize($layers)'/>
   <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
    <xsl:for-each select='$layerlist'>
      <xsl:element name="Map" namespace="http://openmodeller.cria.org.br/xml/2.0">
        <xsl:attribute name="Id">
          <xsl:value-of select="."/>
        </xsl:attribute>
        <xsl:attribute name="IsCategorical">
          <xsl:value-of select="0"/>
        </xsl:attribute>
      </xsl:element>
    </xsl:for-each>
    <xsl:element name="Mask" namespace="http://openmodeller.cria.org.br/xml/2.0">
        <xsl:attribute name="Id">
          <xsl:choose>
            <xsl:when test="$mask = '?'"><xsl:value-of select="$layerlist[1]"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$mask"/></xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
    </xsl:element>
    </xsl:copy>
</xsl:template>

<xsl:template match="om:Presence">
   <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
      <xsl:variable name="p"><xsl:value-of  disable-output-escaping="yes" select="$presence_points"/></xsl:variable>
      <xsl:apply-templates select="exsl:node-set($p)"/>
<!--
    <xsl:for-each select='str:tokenize($presence_points)'>
      <xsl:element name="Point" namespace="http://openmodeller.cria.org.br/xml/2.0">
        <xsl:variable name="coords" select="str:tokenize(.,',')"/>
        <xsl:attribute name="Id">
          <xsl:value-of select="position()"/>
        </xsl:attribute>
        <xsl:attribute name="X">
          <xsl:value-of select="$coords[1]"/>
        </xsl:attribute>
        <xsl:attribute name="Y">
          <xsl:value-of select="$coords[2]"/>
        </xsl:attribute>
      </xsl:element>
    </xsl:for-each>
-->
    </xsl:copy>
</xsl:template>

<xsl:template match="om:ModelParameters">
   <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
      <xsl:variable name="alg"><xsl:value-of  disable-output-escaping="yes" select="$algorithm"/></xsl:variable>
      <xsl:apply-templates select="exsl:node-set($alg)"/>
      <xsl:element name="Options" namespace="http://openmodeller.cria.org.br/xml/2.0">
          <xsl:choose>
            <xsl:when test="$spatially_unique = 'yes' or $environmentally_unique = 'yes'">
              <xsl:element name="OccurrencesFilter" namespace="http://openmodeller.cria.org.br/xml/2.0">
                <xsl:choose>
                  <xsl:when test="$environmentally_unique = 'yes'">
                    <xsl:element name="EnvironmentallyUnique" namespace="http://openmodeller.cria.org.br/xml/2.0"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:element name="SpatiallyUnique" namespace="http://openmodeller.cria.org.br/xml/2.0"/>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:element>
            </xsl:when>
          </xsl:choose>
      </xsl:element>
    </xsl:copy>
</xsl:template>

<!-- identity template -->
<xsl:template match="@*|node()">
   <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
   </xsl:copy>
</xsl:template>

</xsl:stylesheet>
