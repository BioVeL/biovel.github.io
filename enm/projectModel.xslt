<?xml version="1.0" encoding="iso-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:str="http://exslt.org/strings"
xmlns:exsl="http://exslt.org/common"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
exclude-result-prefixes="om str"
xmlns:om="http://openmodeller.cria.org.br/xml/1.0">
<xsl:param name="algorithm"/>
<xsl:param name="layers"/>
<xsl:param name="mask" select="'?'"/>
<xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes" omit-xml-declaration="no"/>
<xsl:variable name="layerlist" select='str:tokenize($layers)'/>

<xsl:template match="om:OutputParameters">
   <xsl:copy>
     <xsl:element name="TemplateLayer" namespace="http://openmodeller.cria.org.br/xml/1.0">
        <xsl:attribute name="Id">
          <xsl:choose>
            <xsl:when test="$mask = '?'"><xsl:value-of select="$layerlist/[0]"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$mask"/></xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
     </xsl:element>
   </xsl:copy>
</xsl:template>

<xsl:template match="om:Environment">
   <xsl:copy>
    <xsl:attribute name="NumLayers">
      <xsl:value-of select="count($layerlist)"/>
    </xsl:attribute>
    <xsl:for-each select='$layerlist'>
      <xsl:element name="Map" namespace="http://openmodeller.cria.org.br/xml/1.0">
        <xsl:attribute name="Id">
          <xsl:value-of select="."/>
        </xsl:attribute>
        <xsl:attribute name="IsCategorical">
          <xsl:value-of select="0"/>
        </xsl:attribute>
      </xsl:element>
    </xsl:for-each>
    <xsl:element name="Mask" namespace="http://openmodeller.cria.org.br/xml/1.0">
        <xsl:attribute name="Id">
          <xsl:choose>
            <xsl:when test="$mask = '?'"><xsl:value-of select="$layerlist/[0]"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$mask"/></xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
    </xsl:element>
    </xsl:copy>
</xsl:template>

<xsl:template match="om:ProjectionParameters">
   <xsl:copy>
      <xsl:variable name="alg"><xsl:value-of  disable-output-escaping="yes" select="$algorithm"/></xsl:variable>
      <xsl:apply-templates select="exsl:node-set($alg)"/>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
</xsl:template>

<!-- identity template -->
<xsl:template match="@*|node()">
   <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
   </xsl:copy>
</xsl:template>

</xsl:stylesheet>
