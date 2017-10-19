package com.thinkbiganalytics.nifi.v1.rest.client;

/*-
 * #%L
 * kylo-nifi-rest-client-api
 * %%
 * Copyright (C) 2017 ThinkBig Analytics
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

import org.apache.nifi.web.api.dto.BundleDTO;
import org.apache.nifi.web.api.dto.ControllerServiceDTO;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

public class NiFiControllerServicesRestClientV1_2Test {

    private NiFiControllerServicesRestClientV1_2 client;

    @Before
    public void setup() {
        client = Mockito.mock(NiFiControllerServicesRestClientV1_2.class, Mockito.CALLS_REAL_METHODS);
    }

    @Test
    public void createNewControllerServiceWithNoBundleInfo() {
        ControllerServiceDTO template = new ControllerServiceDTO();
        template.setName("TestService");
        template.setType("Type");
        template.setComments("Comments");

        ControllerServiceDTO result = client.newControllerService(template);

        // Test created controller service
        Assert.assertTrue("New instance of controller service was not created", template != result);
        Assert.assertEquals(template.getName(), result.getName());
        Assert.assertEquals(template.getType(), result.getType());
        Assert.assertEquals(template.getComments(), result.getComments());
        Assert.assertNull(result.getBundle());
    }

    @Test
    public void createNewControllerServiceWithBundleInfo() {
        ControllerServiceDTO template = new ControllerServiceDTO();
        template.setName("TestService");
        template.setType("Type");
        template.setComments("Comments");
        template.setBundle(new BundleDTO("group", "artifact", "1.0"));

        ControllerServiceDTO result = client.newControllerService(template);

        // Test created controller service
        Assert.assertTrue("New instance of controller service was not created", template != result);
        Assert.assertEquals(template.getName(), result.getName());
        Assert.assertEquals(template.getType(), result.getType());
        Assert.assertEquals(template.getComments(), result.getComments());
        Assert.assertNotNull(result.getBundle());
        Assert.assertTrue("New instance of bundle info was not created", template.getBundle() != result.getBundle());
        Assert.assertEquals(template.getBundle(), result.getBundle());
    }
}
