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

import org.apache.nifi.web.api.dto.ControllerServiceDTO;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

public class NiFiControllerServicesRestClientV1Test {

    private NiFiControllerServicesRestClientV1 client;

    @Before
    public void setup() {
        client = Mockito.mock(NiFiControllerServicesRestClientV1.class, Mockito.CALLS_REAL_METHODS);
    }

    @Test
    public void createNewControllerService() {
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
    }
}
