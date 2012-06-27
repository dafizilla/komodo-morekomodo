<?xml version='1.0' encoding='utf-8' ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" 
                xmlns:em="http://www.mozilla.org/2004/em-rdf#"
                xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

<xsl:variable name="extension-file">
    <xsl:choose>
        <xsl:when test="$use-exploded-chrome = 'true'">
            <xsl:value-of select="'plainfiles'"/>
        </xsl:when>
        <xsl:otherwise>
            <xsl:value-of select="concat(//extension/@name, '.jar')"/>
        </xsl:otherwise>
    </xsl:choose>
</xsl:variable>

<xsl:variable name="chrome-path">
    <xsl:choose>
        <xsl:when test="$use-exploded-chrome = 'true'">
            <xsl:value-of select="'chrome/plainfiles'"/>
        </xsl:when>
        <xsl:otherwise>
            <xsl:value-of select="concat('jar:chrome/', //extension/@name, '.jar!')"/>
        </xsl:otherwise>
    </xsl:choose>
</xsl:variable>

<xsl:template match="//locale" mode="install.js">
<xsl:text>&quot;</xsl:text><xsl:value-of select="@code"/><xsl:text>&quot;</xsl:text>
<xsl:choose>
    <xsl:when test="position() != last()"><xsl:text>,</xsl:text>
    <xsl:choose>
    <xsl:when test="(position() mod 4) = 0"><xsl:text>
                                    </xsl:text>
    </xsl:when>
    <xsl:otherwise><xsl:text> </xsl:text></xsl:otherwise>
    </xsl:choose>
    </xsl:when>
</xsl:choose>
</xsl:template>

<xsl:template match="//skin" mode="install.js">
<xsl:text>&quot;</xsl:text><xsl:value-of select="."/><xsl:text>&quot;</xsl:text>
<xsl:choose>
    <xsl:when test="position() != last()"><xsl:text>,</xsl:text>
    <xsl:choose>
    <xsl:when test="(position() mod 4) = 0"><xsl:text>
                                    </xsl:text>
    </xsl:when>
    <xsl:otherwise><xsl:text> </xsl:text></xsl:otherwise>
    </xsl:choose>
    </xsl:when>
</xsl:choose>
</xsl:template>

<xsl:template match="//pref" mode="install.js">
<xsl:text>&quot;</xsl:text><xsl:value-of select="."/><xsl:text>&quot;</xsl:text>
<xsl:choose>
    <xsl:when test="position() != last()"><xsl:text>,</xsl:text>
    <xsl:choose>
    <xsl:when test="(position() mod 4) = 0"><xsl:text>
                                    </xsl:text>
    </xsl:when>
    <xsl:otherwise><xsl:text> </xsl:text></xsl:otherwise>
    </xsl:choose>
    </xsl:when>
</xsl:choose>
</xsl:template>

<xsl:template match="//component" mode="install.js">
<xsl:text>components.push( [&quot;</xsl:text><xsl:value-of select="@platform-path"/><xsl:text>components/</xsl:text><xsl:value-of select="."/><xsl:text>&quot;, </xsl:text>
<xsl:text>&quot;</xsl:text><xsl:value-of select="."/><xsl:text>&quot;] );</xsl:text>
    <xsl:if test="position() != last()"><xsl:text>
</xsl:text>
    </xsl:if>
</xsl:template>

<xsl:template match="//locale" mode="chrome-manifest">
<xsl:text>locale	</xsl:text><xsl:value-of select="//extension/@name"/>
<xsl:text>	</xsl:text>
<xsl:value-of select="@code"/>
<xsl:value-of select="name"/><xsl:text>	</xsl:text><xsl:value-of select="$chrome-path"/>/locale/<xsl:value-of select="@code"/><xsl:value-of select="//extension/chrome-extension-directory"/>/<xsl:text>
</xsl:text>
</xsl:template>

<xsl:template match="//style" mode="chrome-manifest">
<xsl:text>style	</xsl:text><xsl:value-of select="@uri"/><xsl:text>	</xsl:text><xsl:value-of select="@value"/><xsl:text>
</xsl:text>
</xsl:template>

<xsl:template match="//overlay" mode="chrome-manifest">
<xsl:text>overlay	</xsl:text><xsl:value-of select="@uri"/><xsl:text>	</xsl:text><xsl:value-of select="@value"/><xsl:text>
</xsl:text>
</xsl:template>

<xsl:template match="//resource" mode="chrome-manifest">
<xsl:text>resource	</xsl:text><xsl:value-of select="@alias"/><xsl:text>	</xsl:text><xsl:value-of select="@path"/><xsl:text>
</xsl:text>
</xsl:template>

<xsl:template match="//skin" mode="chrome-manifest">
<xsl:text>skin	</xsl:text><xsl:value-of select="//extension/@name"/><xsl:text>	</xsl:text><xsl:value-of select="@name"/><xsl:text>	</xsl:text><xsl:value-of select="$chrome-path"/><xsl:value-of select="@value"/><xsl:text>
</xsl:text>
</xsl:template>

<xsl:template match="//component" mode="chrome-manifest">
<xsl:variable name="platform">
<xsl:variable name="tempPlatform">
<xsl:call-template name="string-replace-all">
      <xsl:with-param name="text" select="@platform-path"/>
      <xsl:with-param name="replace" select="'platform/'"/>
      <xsl:with-param name="by" select=""/>
    </xsl:call-template>
</xsl:variable>
<xsl:call-template name="string-replace-all">
      <xsl:with-param name="text" select="$tempPlatform"/>
      <xsl:with-param name="replace" select="'/'"/>
      <xsl:with-param name="by" select=""/>
</xsl:call-template>
</xsl:variable>
    <xsl:choose>
        <xsl:when test="@platform='xpt'">
<xsl:text>interfaces	components/</xsl:text><xsl:value-of select="."/>
        </xsl:when>
        <xsl:otherwise>
<xsl:text>binary-component	<xsl:value-of select="concat(@platform-path, 'components/', .)"/></xsl:text>	ABI=<xsl:value-of select="$platform"/>
        </xsl:otherwise>
    </xsl:choose>
<xsl:text>
</xsl:text>
</xsl:template>

<xsl:template name="string-replace-all">
  <xsl:param name="text"/>
  <xsl:param name="replace"/>
  <xsl:param name="by"/>
  <xsl:choose>
    <xsl:when test="contains($text,$replace)">
      <xsl:value-of select="substring-before($text,$replace)"/>
      <xsl:value-of select="$by"/>
      <xsl:call-template name="string-replace-all">
        <xsl:with-param name="text" select="substring-after($text,$replace)"/>
        <xsl:with-param name="replace" select="$replace"/>
        <xsl:with-param name="by" select="$by"/>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$text"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>
</xsl:stylesheet>
