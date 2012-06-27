<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="yes" />

<xsl:template match="extension">

<packages>
  <package name="dist">
    <releases>
      <release name="{version}">
        <files>
          <file name="{@name}-{version}.xpi"/>
        </files>
      </release>
    </releases>
  </package>
</packages>

</xsl:template>
</xsl:stylesheet>